import { constants, promises as fs } from 'fs';
import { dirname, join } from 'path';
import NpmPackageHelper from '..';

/**
 * Integrate version sync script
 */
const run = async () => {
  try {
    // Integrate into package.json
    const { data, path } = await NpmPackageHelper.getFile('package.json', {
      cwd: __dirname
    });
    if (path && data) {
      // Path to file
      const versionSyncPath = join(dirname(path), 'extras', 'sync-version.ts');

      // Create directory
      await fs.mkdir(dirname(versionSyncPath));

      // Copy file
      await fs.copyFile(
        join(__dirname, '..', '..', 'templates', 'run.template.ts'),
        versionSyncPath,
        constants.COPYFILE_EXCL
      );

      if (
        data.husky &&
        data.husky.hooks &&
        data.husky.hooks['pre-commit'] &&
        !data.husky.hooks['pre-commit'].includes('sync-version')
      ) {
        data.husky.hooks['pre-commit'] =
          'ts-node --skip-project extras/sync-version.ts && ' +
          data.husky.hooks['pre-commit'];
        await NpmPackageHelper.setFile(path, data);
      }
    }
  } catch (e) {
    if (e && e.code !== 'EEXIST') {
      return e;
    }
  }

  // Everything is ok
  return;
};
run().then(error => {
  if (error) {
    console.log(error);
  } else {
    console.log('Sync script integrated');
  }
});
