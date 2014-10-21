var fs = require('fs');
var glob = require('glob');
var tv4 = require('tv4');
var tv4formats = require('tv4-formats');

tv4.addFormat(tv4formats);

// register all schemas
var schemas = fs.readdirSync('schemas');
for (var i in schemas) {
  // skip hidden files
  if (/^\./.exec(schemas[i])) {
    continue;
  }

  process.stdout.write(
    'Registering schema from \'schemas/' + schemas[i] + '\''
  );

  // parse schema JSON
  var schema = JSON.parse(fs.readFileSync('schemas/' + schemas[i]));

  // register schema
  tv4.addSchema(schema);

  console.log(' as \'' + schema.id + '\' succeeded.');
}

console.log();

// read all schemas+examples and validate
var dirs = ['schemas', 'examples'];
for (var j in dirs) {
  glob(dirs[j] + '/*.json', function (err, files) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    for (var i in files) {
      var file = files[i];
        
      process.stdout.write('Validating \'' + file + '\'... ');

      // parse example JSON
      var example = JSON.parse(fs.readFileSync(file, 'utf8'));

      // get schema
      if (!example.$schema) {
        console.log('Error: schema missing.');
        process.exit(1);
      }
      var schema = tv4.getSchema(example.$schema);

      // validate examples
      var valid = tv4.validate(example, schema);
      if (!valid) {
        console.log('Error:\n' +
          tv4.error.message + '\n' +
          JSON.stringify(tv4.error, null, 2)
        );
        process.exit(1);
      }
      console.log('passed.');
    }
  });
}

// this is the end, my friend!
console.log('\nAll JSON files passed the schema validation.');

// check for missing schemas
for (var i in tv4.missing) {
  console.log('Error: schema \'' + tv4.missing[i] + '\' is missing!');
  process.exit(1);
}
