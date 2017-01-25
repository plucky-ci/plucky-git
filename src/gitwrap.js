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

	commit(file) {
		let repository, index, oid, remote;
		return Git.Repository.open(this.repoDirectory)
		.then((repo) => {
			repository = repo;
			return repository.refreshIndex();
		}).then((indexResult) => {
			console.log(indexResult);
			index  = indexResult;

			// this file is in the root of the directory and doesn't need a full path
			return index.addByPath(file);
		}).then(() => {
			// this will write files to the index
			return index.write();
		}).then(() => {
			return index.writeTree();
		}).then((oidResult) => {

			oid = oidResult;
			return Git.Reference.nameToId(repository, "HEAD");

		}).then((head) => {

			return repository.getCommit(head);

		}).then((parent) => {

			const author = Git.Signature.now("Plucky", "consoleteam@pearson.com");
			const committer = Git.Signature.now("Plucky", "consoleteam@pearson.com");
			return repository.createCommit("HEAD", author, committer, "updated blue green", oid, [parent]);
		}).then((commitId) => {
			return console.log("New Commit: ", commitId);
		})
		/// PUSH
		.then(() => {
			return repository.getRemote("origin");
		}).then((remoteResult) => {
			console.log('remote Loaded');
			remote = remoteResult;

			console.log('remote Configured');
			return remote.push(
				["refs/heads/master:refs/heads/master"],
				this.cloneOptions.fetchOpts,
				repository.defaultSignature(),
				"Push to master"
			);
		})
		.catch((reason) => {
			console.log(reason);
		})
	}
}

module.exports = GitWrap;