var fs = require('fs');
var tv4 = require('tv4');

// register all schemas
var schemas = fs.readdirSync('schemas');
for (var i in schemas) {
  // skip hidden files
  if (/^\./.exec(schemas[i])) {
    continue;
  }

  // parse schema JSON
  var schema = JSON.parse(fs.readFileSync('schemas/' + schemas[i]));

  // register schema
  tv4.addSchema(schema);

  console.log(
    'Registered schema from \'schemas/' + schemas[i] + '\' as \'' +
     schema.id +'\'.'
  );
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
  var schema = tv4.getSchema(example.$schema_id);

  // validate!
  var valid = tv4.validate(example, schema);
  if (!valid) {
    console.log(
      'failed.\nError validating \'examples/' + files[i] + '\':\n' +
      tv4.error.message + '\n' +
      JSON.stringify(tv4.error, null, 2)
    );
    process.exit(1);
  }
  process.stdout.write('passed.\n');
}

// this is the end, my friend!
console.log('\nAll examples passed the schema validation.');
