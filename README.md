# metric

Metric is a a command-line converter to change [Toolbox](http://www-01.sil.org/computing/toolbox/) text files into correct JSON for use with the [Ailot mobile dictionary](https://github.com/phonemica/ailot) and the [Ichō dictionary tool](). This is a preliminary version just to get the job done. User-friendliness and the ability to set custom fields will be added shortly.

The tool has been developed with Node.js since that is also a requirement for compiling new versions of the dictionary app itself.

Future versions of Metric will be able to handle other popular formats, most notably FLEx.

## Formats

With this tool and a few small changes, you can easily take this…

```
\se cpq
\le
\ph cap1
\ps v
\de ( of birds ) perch, sit, rest as a bird on a tree
\ge perch
\pl
\pd
\pde
\pdn
\dn
\rf
\xv tInukqcpq
\xr tI5 nok4 cap1
\xe a perch, a branch, bar etc. on which birds rests or roosts
\xv nukqtuwqnJgqcpqsUtIxamj
\xr nok4 cap1 tI5 khA4 mai4
\xe a bird perch on a branch of a tree
\xn
```

…and convert it to the common dictionary format used by Ailot, Ichō, and other Phonemica dictionary toos, like this:

```json
[{
	"definition": {
		"english": [
			"( of birds ) perch, sit, rest as a bird on a tree"
		]
	},
	"example": {
		"english": [
			"a bird perch on a branch of a tree"
		],
		"phonemic": [
			"nok4 cap1 tI5 khA4 mai4"
		],
		"script": [
			"nukqtuwqnJgqcpqsUtIxamj"
		]
	},
	"gloss": {
		"english": "perch",
		"phake": "cpq"
	},
	"image": [],
	"lexeme": "cpq",
	"phonemic": {
		"phake": "cap1"
	},
	"pos": [
		"v."
	]
}]
```

Through changes to `fields.js` you can make it work with any Toolbox field names you've previous set. It's a straightforward conversion script, and while it's small and unimpressive, it serves a much needed function.

## Screenshot

![](http://phonemica.net/github/0jpsf46f.png)
