const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const fs = require('fs-extra');
const path = require('path');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

const {
	PluckyClone,
	PluckyCommitAndPush
} = require('../src/pluckyclone');

const noop = ()=>{};

describe('PluckyGit', ()=>{
	describe('PluckyClone', () => {
		it('should return 1 and a status string when repository is not included', (done) => {
			const git = new PluckyClone();

			git.handler({params: {folder: 'clonerepo'}}, (code, val) => {
				expect(code).to.equal(1);
				expect(val.status).to.be.a.string();
				done();
			});
		});

		it('should return 1 and a status string when folder does not exist', (done) => {
			const git = new PluckyClone();

			git.handler({params: {repository: '/plucky-git'}}, (code, val) => {
				expect(code).to.equal(1);
				expect(val.status).to.be.a.string();
				done();
			});
		});

		it('should return 0 and a result string when cloning to a new directory', (done) => {
			const git = new PluckyClone();
			const repo = path.join(process.cwd(), 'testdirectory/.git');
			git.handler({params: {repository: `file://${repo}`, folder:'clonedtestdirectory'}}, (code, val) => {
				expect(code).to.equal(0);
				expect(val.result).to.be.a.string();
				fs.remove('clonedtestdirectory', (err) => {
					done();
				});
			});
		});

		it('should return 1 and a status string when repository does not exist', (done) => {
			const git = new PluckyClone();
			git.handler({params: {repository: 'asdf/.git', folder:'clonedtestdirectory'}}, (code, val) => {
				expect(code).to.equal(1);
				expect(val.status).to.be.a.string();
				done();
			});
		});

		it('should clone first and then do fastforward merge', (done) => {
			const git = new PluckyClone();
			// const repo = path.join(process.cwd(), 'testdirectory/.git');
			git.handler({params: {repository: 'git@github.com:loahou04/testdirectory.git', folder:'clonedtestdirectory'}}, (code, val) => {
				expect(code).to.equal(0);
				expect(val.result).to.be.a.string();
				git.handler({params: {repository: 'git@github.com:loahou04/testdirectory.git', folder:'clonedtestdirectory'}}, (code, val) => {
					expect(code).to.equal(0);
					expect(val.result).to.be.a.string();
					fs.remove('clonedtestdirectory', (err) => {
						done();
					});
				});
			});
		});
	});

	describe('PluckyCommit', () => {
		it('should commit commit a new file to the repository', (done) => {
			const git = new PluckyClone();
			// const repo = path.join(process.cwd(), 'testdirectory/.git');
			git.handler({params: {repository: 'git@github.com:loahou04/testdirectory.git', folder:'clonedtestdirectory'}}, (code, val) => {
				expect(code).to.equal(0);
				expect(val.result).to.be.a.string();

				const pluckyCommitAndPush = new PluckyCommitAndPush();
				pluckyCommitAndPush.handler({params: {
					folder:'clonedtestdirectory',
					file: 'README.md'
				}}, (code, val) => {
					expect(code).to.be.equal(0);
					fs.remove('clonedtestdirectory', (err) => {
						done();
					});
				});
			});
		});
	});
});
