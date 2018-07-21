const h = require('../test-helpers.js');
const unpm = require('../../lib/unity-npm-utils');

const cpTest2SrcBehaviour = require('../shared/package-cp-test2src-behaviour.js')

describe(`'npm run test-cp2src' - copies files from a pkg's unity test proj back to src`, () => {
    cpTest2SrcBehaviour((opts) => {
        return h.runPkgCmd('npm run test-cp2src', opts.package_path);
    }, {
        expect_deletes_from_package: false
    });
});
