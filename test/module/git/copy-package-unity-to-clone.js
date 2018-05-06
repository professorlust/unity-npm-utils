
const expect = require('chai').expect
const Repo = require('git-tools')
const path = require('path')
const fs = require('fs-extra-promise')
const tmp = require('tmp-promise')

const h = require('../../test-helpers.js')
const unpm = require('../../../lib/unity-npm-utils')
const VERBOSE = true

describe.only("git.copyPackageUnityToClone - copies changes made in installed unity package back to a git clone", () => {

    it("clones the package outside the unity project", async function() {
        this.timeout(300000);

        const testProjPath = await h.installLocalUnpmToPackage()

        expect(
          fs.existsSync(path.join(testProjPath, 'package.json')),
          'test project should be installed at root ' + testProjPath
        ).to.equal(true)

        var testProj = await unpm.readPackage(testProjPath)

        expect(
          testProj.dependencies['unity-npm-utils']
        ).to.exist

        const pkgToClone = "property-interfaces"
        const scope = "beatthat"
        const pkgToCloneFullName = `${scope}/${pkgToClone}`

        await h.runPkgCmdAsync('npm install --save ' + pkgToCloneFullName, testProjPath)

        const d = await tmp.dir()

        const result = await unpm.git.copyPackageUnityToClone(pkgToClone, {
            project_root: testProjPath,
            clone_dir: path.join(d.path, 'clones'),
            verbose: VERBOSE
        })

        expect(typeof(result.unpmLocal),
            "result should include the (updated) unpm-local file for the project, read to a json object"
        ).to.equal('object')

        expect(typeof(result.unpmLocal.packages),
            "result unpmLocal should contain a 'packages' object"
        ).to.equal('object')

        const pkgEntry = result.unpmLocal.packages[pkgToClone]

        expect(typeof(pkgEntry),
            `result unpmLocal should contain a an entry for the cloned package (${pkgToClone})`
        ).to.equal('object')

        expect(typeof(pkgEntry.clone),
            `result unpmLocal should contain a an entry for the cloned package (${pkgToClone}) with a 'clone' info object`
        ).to.equal('object')

        const clonePkg = h.readPackageSync(pkgEntry.clone.path)
        expect(clonePkg.name, 'clone package has name set').to.equal(pkgToClone)

        const repo = new Repo(pkgEntry.clone.path)

        expect(await repo.isRepo(), `should be a repo at path ${repo.path}`).to.equal(true)

        if(VERBOSE) {
            console.log(`checking repo at path ${repo.path}...`)
        }

        const status = await repo.exec('status', '--short')

        expect(status.trim().length, 'git status should show no local changes').to.equal(0)
    });

    it.skip("copies files newly created in unity install back to copyFromUnityInstallToClone", async function() {
        this.timeout(300000);

        const testProjPath = await h.installLocalUnpmToPackage({
            verbose: VERBOSE
        })

        expect(
          fs.existsSync(path.join(testProjPath, 'package.json')),
          'test project should be installed at root ' + testProjPath
        ).to.equal(true)

        var testProj = await unpm.readPackage(testProjPath)

        expect(
          testProj.dependencies['unity-npm-utils']
        ).to.exist

        const scope = "beatthat"
        const pkgToClone = "properties"
        const pkgToCloneFullName = "beatthat/properties"

        await h.runPkgCmdAsync('npm install --save ' + pkgToCloneFullName, testProjPath)

        const unityPkgInstallPath = path.join(testProjPath,
            'Assets', 'Plugins', 'packages', 'beatthat', 'properti')

        expect(await fs.existsAsync(unityPkgInstallPath),
            "package is installed where we expect under Unity Assets")

        const testAddFileName = 'TestFile.txt'
        const testAddFilePath = path.join(unityPkgInstallPath, testAddFileName)
        const testAddFileContent = "Test that this content gets copied back to clone"

        await fs.writeFileAsync(testAddFilePath, testAddFileContent)

        const d = await tmp.dir()

        const result = await unpm.git.copyPackageUnityToClone(pkgToClone, {
            project_root: testProjPath,
            clone_dir: path.join(d.path, 'clones'),
            verbose: VERBOSE
        })

        if(VERBOSE) {
            console.log(`copyPackageUnityToClone result: \n${JSON.stringify(result, null, 2)}`)
        }

        expect(typeof(result.unpmLocal),
            "result should include the (updated) unpm-local file for the project, read to a json object"
        ).to.equal('object')

        expect(typeof(result.unpmLocal.packages),
            "result unpmLocal should contain a 'packages' object"
        ).to.equal('object')

        const pkgEntry = result.unpmLocal.packages[pkgToClone]

        expect(typeof(pkgEntry),
            `result unpmLocal should contain a an entry for the cloned package (${pkgToClone})`
        ).to.equal('object')

        expect(typeof(pkgEntry.clone),
            `result unpmLocal should contain a an entry for the cloned package (${pkgToClone}) with a 'clone' info object`
        ).to.equal('object')

        const repo = new Repo(pkgEntry.clone.path)

        expect(await repo.isRepo(), `should be a repo at path ${repo.path}`).to.equal(true)

        const cloneAddFilePath = path.join(pkgEntry.clone.path, 'Runtime', pkgToClone, testAddFileName)

        expect(await fs.existsAsync(cloneAddFilePath),
            "should have copied file added to unity from install path in unity to clone"
        ).to.equal(true)

        expect(await fs.readFileAsync(cloneAddFilePath, 'utf8'),
            "should have copied file added to unity from install path in unity to clone"
        ).to.equal(testAddFileContent)

    });


});
