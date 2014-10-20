var fs = require('fs');
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

// read all examples and validate
var files = fs.readdirSync('examples');
for (var i in files) {
  // skip hidden files
  if (/^\./.exec(files[i])) {
    continue;
  }

  process.stdout.write('Validating \'examples/' + files[i] + '\'... ');

  // parse example JSON
  var example = JSON.parse(fs.readFileSync('examples/' + files[i], 'utf8'));

  // get schema
  if (!example.$schema) {
    console.log('Error: schema missing in example JSON.');
    process.exit(1);
  }
  var schema = tv4.getSchema(example.$schema);

  // validate!
  var valid = tv4.validate(example, schema);
  if (!valid) {
    console.log('Error:\n' +
      tv4.error.message + '\n' +
      JSON.stringify(tv4.error, null, 2)
    );
    process.exit(1);
  }
  process.stdout.write('passed.\n');
}

// this is the end, my friend!
console.log('\nAll examples passed the schema validation.');

// check for missing schemas
for (var i in tv4.missing) {
  console.log('Error: schema \'' + tv4.missing[i] + '\' is missing!');
  process.exit(1);
}
