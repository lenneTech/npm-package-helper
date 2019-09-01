import { exec as execChildProcess } from 'child_process';
import * as compareVersions from 'compare-versions';
import * as find from 'find-file-up';
import * as fs from 'fs';
import { dirname, sep } from 'path';
import { promisify } from 'util';
import IFileData from '../interfaces/file-data.interface';

// Promisify exec
const exec = promisify(execChildProcess);

/**
 * Helper for npm packages
 */
export default class NpmPackageHelper {
  /**
   * Get file
   */
  public static async getFile(
    fileNameOrPath: string,
    options: {
      // if cwd is set, the file with the specified file name is searched in the specified directory and in all parent directories
      cwd?: string;
    } = {}
  ): Promise<{ path: string; data: any }> {
    // Prepare options
    const opts = Object.assign({}, options);

    // Find file
    const path = opts.cwd
      ? await find(fileNameOrPath, opts.cwd)
      : fileNameOrPath;
    if (!path) {
      return { path: '', data: null };
    }

    // Everything ok
    return { path, data: await NpmPackageHelper.readFile(path) };
  }

  /**
   * Read a file
   */
  public static readFile(
    path: string,
    options: { json?: boolean } = { json: true }
  ) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (path.endsWith('.json') || (options && options.json)) {
            resolve(JSON.parse(data.toString()));
          } else {
            resolve(data);
          }
        }
      });
    });
  }

  /**
   * Set data in file
   */
  public static async setFile(
    fileNameOrPath: string,
    data: string | { [key: string]: any },
    options: {
      // if cwd is set, the file with the specified file name is searched in the specified directory and in all parent directories
      cwd?: string;
    } = {}
  ) {
    if (typeof data === 'object') {
      data = JSON.stringify(data, null, 2);
    }

    // Path to file
    const { path } = await NpmPackageHelper.getFile(fileNameOrPath, options);
    if (!path) {
      return;
    }

    // Write
    try {
      fs.unlinkSync(path);
      fs.writeFileSync(path, data);
    } catch (e) {
      return '';
    }

    // Done
    return;
  }

  /**
   * Get file data
   */
  public static async getFileData(
    fileName: string,
    options: {
      // if cwd is set, the file with the specified file name is searched in the specified directory and in all parent directories
      cwd?: string;
    } = {}
  ) {
    const fileData: IFileData = { file: fileName };
    Object.assign(fileData, await NpmPackageHelper.getFile(fileName, options));
    if (!fileData.path) {
      throw new Error(`Missing ${fileName}`);
    }
    return fileData;
  }

  /**
   * Get highest semantic version in FileData array
   */
  public static async getHighestVersion(
    fileDataArray: IFileData[] | Promise<IFileData>[]
  ) {
    if (!fileDataArray || !fileDataArray.length) {
      return null;
    }
    let highestVersion = '0.0.0';
    for (let item of fileDataArray) {
      item = await item;
      if (
        item &&
        item.data &&
        item.data.version &&
        compareVersions(item.data.version, highestVersion) === 1
      ) {
        highestVersion = item.data.version;
      }
    }
    return highestVersion;
  }

  /**
   * Find out and set hightest semantic version
   */
  public static async setHighestVersion(
    fileDataArray: IFileData[] | Promise<IFileData>[]
  ) {
    // Init
    const promises = [];
    const paths = [];

    // Get highest version
    const highestVersion = await NpmPackageHelper.getHighestVersion(
      fileDataArray
    );

    // Set highest version
    for (let item of fileDataArray) {
      item = await item;
      if (item && item.data && item.data.version !== highestVersion) {
        item.data.version = highestVersion;
        promises.push(NpmPackageHelper.setFile(item.path, item.data));
        paths.push(item.path);
      }
    }
    await Promise.all(promises);

    // Add changed files to commit
    if (promises.length) {
      const gitPath = dirname(await find('.git', dirname(paths[0])));
      if (gitPath) {
        await exec(
          `cd ${gitPath} && git add ${paths
            .map(item => {
              return item.replace(gitPath + sep, '');
            })
            .join(' ')}`
        );
      }
    }

    // Return highest version
    return highestVersion;
  }
}
