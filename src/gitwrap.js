const Git = require('nodegit');
const path = require('path');
const fsextra = require('fs-extra');
const fs = require('fs');

class GitWrap {

	constructor(folder, repository) {
		this.cloneOptions = { fetchOpts : {
		  callbacks: {
		    certificateCheck: function() { return 1; },
		    credentials: function(url, userName) {
		      return Git.Cred.sshKeyFromAgent(userName);
		    }
		  }
		}};
		this.repoDirectory = path.join(process.cwd(), folder);
		this.repository = repository;
	}

	clone() {

		return new Promise((resolve, reject) => {
			fs.access(this.repoDirectory, fs.F_OK, (err) => {
				if(err) {
					// fs access error means directory does not exist.
					return Git.Clone(this.repository, this.repoDirectory, this.cloneOptions)
					.then((repository) => {
						resolve({});
					}).catch((error) => {
						reject(error);
					});
				}
				let repository;
				Git.Repository.open(this.repoDirectory).then((repo) => {
					repository = repo;
					return repository.fetchAll(this.cloneOptions.fetchOpts, true);
				}).then(() => {
					repository.mergeBranches('master', 'origin/master');
				}).then(() => {
					resolve({});
				}).catch((error) => {
					reject(error);
				});
			});
		});
	}
}

module.exports = GitWrap;