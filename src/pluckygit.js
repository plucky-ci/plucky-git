const {Task} = require('plucky-pipeliner');
const Git = require('nodegit');
const path = require('path');
const fs = require('fs-extra');

class PluckyGit extends Task {
	execute(state, next) {
		const {
			params = {},
		} = state;
		if(!params.repository) {
			return next(1, {status: 'repository must exist'});
		}
		if(!params.folder) {
			return next(1, {status: 'folder must exist'});
		}

		const repoDirectory = path.join(process.cwd(), params.folder);
		fs.remove(repoDirectory, (err) => {
			if(err) {
				return next(1, {status:error.toString()});
			}
			Git.Clone(params.repository, repoDirectory)
			.then((repository) => {
				return next(0, {result: 'repository cloned'});
			}).catch((error) => {
				return next(1, {status:error.toString()});
			});
		});
	}
}

module.exports = { PluckyGit };