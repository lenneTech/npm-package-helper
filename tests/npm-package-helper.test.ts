import { join } from 'path';
import * as config from '../package.json';
import NpmPackageHelper from '../src';

test('NpmPackageHelper.getFile with path parameter', async () => {
  const { data } = await NpmPackageHelper.getFile(
    join(process.cwd(), 'package.json')
  );
  expect(data.version).toBe(config.version);
});

test('NpmPackageHelper.getFile with cwd parameters', async () => {
  const { data } = await NpmPackageHelper.getFile('package.json', {
    cwd: process.cwd()
  });
  expect(data.version).toBe(config.version);
});

test('NpmPackageHelper.getHighestVersion', async () => {
  const version = await NpmPackageHelper.getHighestVersion([
    { data: { version: '2.3.4' } },
    { data: { version: '3.1.3' } },
    { data: { version: '3.1.4' } },
    { data: { version: '3.3.3' } },
    { data: { version: '0.0.1' } }
  ]);
  expect(version).toBe('3.3.3');
});
