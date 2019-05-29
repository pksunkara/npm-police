# police
A module dependency version policing tool. It goes through all your repositories on github which has package.json.
Then it analyzes the dependencies and reports back to you about all the outdated packages.

It also can suggest corrections to your package.json file in certain cases.

<p align=center><img src=screencast.svg width=600></p>

## Installation
Install police globally from npm registry by typing the following command

```
npm install police -g
```

## Usage
For the first time after you installed police, you need to authenticate yourself to [github](http://github.com).
This is a one-time step

```
police auth
```

**Note:** We will not save your [github](http://github.com) password anywhere. A token which we acquire during
the authentication will be used thereafter. And it will be saved in a file with permissions `0600`

Does not work when 2 factor authorization is enabled. Please create a personal use token [here](https://github.com/settings/tokens/new) and edit the `./policeconf` file.

```sh
# To police your module dependencies
police

# To police a particular module (You should give the repository name)
police octonode

# To police another user/org module dependencies
police -u flatiron

# To police a particular module of another user/org (You should give the repository name)
police flatiron/plates

# To police a local module or package.json file
police -l ~/octonode
police -l ~/octonode/package.json

# To continue checking even though errors are encountered (Doesnt work with -l)
police -f
police -u flatiron -f

# To edit all the fields in package.json (Doesnt work with -l)
police -e

# To add the missing fields to package.json (Doesnt work with -l)
police -a

# To update dependencies in package.json
police -t
```

Given below are some ideal commands to help you.

```sh
# An ideal police command for github user for the first time on a module
police -f -e -t

# An ideal police command for github user
police -f -a -t

# An ideal police command locally
police -l ~/octonode -t
```

The token which we acquied during auth will be stored in `$HOME/.policeconf`. If you want to use another config file

```
police octonode --conf /etc/policeconf
police octonode --conf ~/.conf
```

If you want to destory your token, you can use

```
police -d
police --destroy
```

Calling police with help option will display all the above

```
police -h
police --help
```

If you like this project, please watch this and [follow](http://github.com/users/follow?target=pksunkara) me.

## Testing
```
npm test
```

## Contributors
Here is a list of [Contributors](http://github.com/pksunkara/npm-police/contributors)

### TODO
- Option to isolate dependency checking and suggestions
- Support multiple npm registries (custom)
- Display progress bar instead of listing the dependencies (use charm)
- Caching package.json blobs per commit
- Start using [octonode](http://github.com/pksunkara/octonode) module
- Command for setting and deleting configurations

__I accept pull requests and guarantee a reply back within a day__

## License
MIT/X11

## Bug Reports
Report [here](http://github.com/pksunkara/npm-police/issues). __Guaranteed reply within a day__.

## Contact
Pavan Kumar Sunkara (pavan.sss1991@gmail.com)

Follow me on [github](http://github.com/pksunkara), [twitter](http://twitter.com/pksunkara)

Concept by: [Martin Wawrusch](http://github.com/mwawrusch) (martin@wawrusch.com)
