const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const spawn = require('child_process').spawn;
const mlog = require('mocha-logger');

const h = require('../test-helpers.js');
const unpm = require('../../lib/unity-npm-utils');

tmp.setGracefulCleanup();

describe("setPackageVersion - sets the version for a package", () => {
    var pkgPath = null;

    beforeEach(async function() {
        this.timeout(10000);

        pkgPath = await h.installUnityPackageTemplateToTemp();
    });

    it("accepts package OBJECT as arg", async function() {
        this.timeout(10000);

        const pkg = h.readPackageSync(pkgPath);
        const oldVersion = pkg.version;
        const newVersion = '1.2.3';

        const pkgAfter = await unpm.setPackageVersion(pkg, newVersion);
        expect(pkg.version, 'should modify only copy of package passed to callback').to.equal(oldVersion);
        expect(pkgAfter.version).to.equal(newVersion);
    });


});
