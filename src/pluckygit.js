const {Task} = require('plucky-pipeliner');
const Git = require('nodegit');
const path = require('path');
const fs = require('fs-extra');

class PluckyGit extends Task {
	handler(state, next) {
		const {
			params = {},
		} = state;
		if(!params.repository) {
			return next(1, {status: 'repository must exist'});
		}
		if(!params.folder) {
			return next(1, {status: 'folder must exist'});
		}
		// i'm not sure what the userName that is being passed in..but it seems to work. 
		// it is probably grabbing it from the ssh key but i have no idea 
		const cloneOptions = { fetchOpts : {
		  callbacks: {
		    certificateCheck: function() { return 1; },
		    credentials: function(url, userName) {
		      return Git.Cred.sshKeyFromAgent(userName);
		    }
		  }
		}};
		const repoDirectory = path.join(process.cwd(), params.folder);
		fs.remove(repoDirectory, (err) => {
			if(err) {
				return next(1, {status:error.toString()});
			}
			Git.Clone(params.repository, repoDirectory, cloneOptions)
			.then((repository) => {
				return next(0, {result: repoDirectory});
			}).catch((error) => {
				console.log(error);
				return next(1, {status:error.toString()});
			});
		});
	}
}

module.exports = { PluckyGit };