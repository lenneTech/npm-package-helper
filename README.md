# Npm package helper

[lenne.Tech](https://github.com/lenneTech) helper for handling npm packages.

For example, the versions of package.json and package-lock.json can be synchronized very easily.

[![License](https://img.shields.io/github/license/lenneTech/npm-package-helper)](/LICENSE) [![CircleCI](https://circleci.com/gh/lenneTech/npm-package-helper/tree/master.svg?style=shield)](https://circleci.com/gh/lenneTech/npm-package-helper/tree/master)
[![Dependency Status](https://david-dm.org/lenneTech/npm-package-helper.svg)](https://david-dm.org/lenneTech/npm-package-helper) [![devDependency Status](https://david-dm.org/lenneTech/npm-package-helper/dev-status.svg)](https://david-dm.org/lenneTech/npm-package-helper?type=dev)

<!--
[![GitHub forks](https://img.shields.io/github/forks/lenneTech/npm-package-helper)](https://github.com/lenneTech/npm-package-helper/fork) [![GitHub stars](https://img.shields.io/github/stars/lenneTech/npm-package-helper)](https://github.com/lenneTech/npm-package-helper)
-->

## Installation

```
$ npm install --save-dev @lenne.tech/npm-package-helper
```

## Usage

After installing this package, the root directory of the project should contain the following script, which synchronizes the package.json and package-lock.json versions:

`extras/sync-version.ts`

```typescript
import NpmPackageHelper from '@lenne.tech/npm-package-helper';
import { join } from 'path';

// Sync version of package.json and package-lock.json
const run = () => {
  // Init
  const nph = NpmPackageHelper;
  const dir = process.cwd();

  // Set highest version
  nph
    .setHighestVersion([
      nph.getFileData(join(dir, 'package-lock.json')),
      nph.getFileData(join(dir, 'package.json'))
    ])
    .then(version => {
      // Log version
      console.log(version);
    });
};
run();
```

This script can be used by husky, for example:

`package.json`

```json5
{
  // ...
  husky: {
    hooks: {
      'pre-commit': 'ts-node extras/sync-version.ts && pretty-quick --staged',
      'pre-push': 'npm run lint && npm run test'
    }
  }
  // ...
}
```

## License

MIT - see LICENSE
