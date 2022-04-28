let { FieldType, PrimitiveDataType } = require('../lib');
let getODM = require('./getODM');

getODM().then(function (odm) {
  odm.addFieldType(
    class extends FieldType {
      constructor(odm) {
        super(odm, PrimitiveDataType.STRING);
      }

      getName() {
        return 'email';
      }

      async validateValue(schema, fieldName, record, context) {
        const pattern = '(.+)@(.+){2,}\\.(.+){2,}';
        if (!new RegExp(pattern).test(record[fieldName]))
          throw new Error('Not a valid email');
      }

      validateDefinition(fieldDefinition) {
        return !!fieldDefinition.name;
      }

      setValueIntercept(schema, field, newValue, record) {
        return newValue;
      }
    }
  );

  odm.defineCollection({
    label: 'Student',
    name: 'student',
    fields: [
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'personal_contact',
        type: 'email'
      },
      {
        name: 'emp_no',
        type: 'objectId'
      },
      {
        name: 'salary',
        type: 'integer'
      },
      {
        name: 'birth_date',
        type: 'date'
      },
      {
        name: 'gender',
        type: 'boolean'
      },
      {
        name: 'address',
        type: 'object'
      }
    ]
  });

  let studentCollection = odm.collection('student');
  let studentRecord = studentCollection.createNewRecord();
  studentRecord.set('personal_contact', 'test');
  studentRecord.set('birth_date', new Date());
  studentRecord.insert().then(
    function () {
      console.log('Student created');
    },
    (err) => {
      console.log(err.toJSON());
      odm.closeConnection().then(function () {
        console.log('Connection closed');
      });
    }
  );
});
