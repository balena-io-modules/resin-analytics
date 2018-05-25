# resin-analytics

A collection of modules used by resin (UI and CLI) to track analytics events.

The project uses [lerna](https://github.com/lerna/lerna) to work on the submodules.

See the `packages` subfolders for each module's documentation.

# Publishing

1. PR your code changes
1. Merge the PR (using the merge button)
1. run `lerna updated` to check which modules need to be published. This should result something like:
	```
	lerna info Comparing with resin-event-log@1.8.0.
	lerna info result 
	- resin-event-log
	```

1. decide the version numbers for the updated packages, write and commit the changelogs for all packages that are going to be updated.
1. run `lerna publish`. Lerna will:
	* ask you what is the desired version for each of the updated package:
		```
		lerna info Checking for updated packages...
		lerna info Comparing with resin-event-log@1.8.0.
		> ? Select a new version for resin-event-log (currently 8.0) (Use arrow keys)
		❯ Patch (1.8.1)
		  Minor (1.9.0)
		  Major (2.0.0)
		  Prepatch (1.8.1-0)
		  Preminor (1.9.0-0)
		  Premajor (2.0.0-0)
		  Prerelease
		  Custom
		```

	* update the version & dependencies in the `package.json`s
	* add a `Publish` commit
	* run `npm publish` to the affected modules

Clarifications:
* While using lerna you should normally not need to manually modify the the `package.json` version field.
* If you update a module that others depend on it, then lerna will increase dependent package version & package version of all consumer projects & publish a new version of it. Eg: if you update resin-mixpanel-client then lerna will also update resin-event-log and bump the dependency version.

TIP: if you logout from npm, you can try a publish to check its results.
