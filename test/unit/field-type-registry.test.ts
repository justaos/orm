import { assert } from 'chai';
import 'mocha';
import { ODM, Record, StringDataType } from '../../src';
import { Session } from '../test.utils';
import { Logger } from '@justaos/utils';
import Schema from '../../src/collection/Schema';
import Field from '../../src/collection/Field';
import FieldType from '../../src/field-types/FieldType.interface';

const logger = Logger.createLogger({ label: 'FieldType' });

describe('FieldType', () => {
  let odm: ODM;

  const MODEL_NAME = 'field_definition_test';
  const EMAIL_TYPE = 'email';
  const EMAIL_FIELD = 'email';
  const EMAIL_VALUE = 'test@example.com';

  before(async () => {
    odm = await Session.getODMByForce();
  });

  it('#FieldTypeRegistry::addFieldType Registering Custom field type', function() {
    odm.addFieldType(
      new (class extends FieldType {
        setODM() {
        }

        getDataType() {
          return new StringDataType();
        }

        getType() {
          return 'email';
        }

        async validateValue(
          schema: Schema,
          field: Field,
          record: any,
          context: any
        ) {
          const pattern = '(.+)@(.+){2,}\\.(.+){2,}';
          if (!new RegExp(pattern).test(record[field.getName()]))
            throw new Error('Not a valid email');
        }

        validateDefinition(fieldDefinition: any) {
          return !!fieldDefinition.name;
        }

        getValueIntercept(
          schema: Schema,
          field: Field,
          record: any,
          context: any
        ): any {
          return record[field.getName()];
        }

        setValueIntercept(
          schema: Schema,
          field: Field,
          newValue: any,
          record: any,
          context: any
        ): any {
          return newValue;
        }

        async getDisplayValue(
          schema: any,
          field: Field,
          record: any,
          context: any
        ) {
          return record[field.getName()];
        }
      })()
    );

    try {
      odm.defineCollection({
        name: MODEL_NAME,
        fields: [
          {
            name: 'name',
            type: 'string'
          },
          {
            name: EMAIL_FIELD,
            type: EMAIL_TYPE
          }
        ]
      });
      assert.isOk(true, 'Custom field defined as expected');
    } catch (err) {
      console.error(err);
      assert.isOk(false, 'Custom field not defined as expected');
    }
  });

  it('#FieldTypeRegistry::registerFieldType creating record with custom field type', function(done) {
    let collection = odm.collection(MODEL_NAME);
    let rec = collection.createNewRecord();
    rec.set('name', 'RAM');
    rec.set(EMAIL_FIELD, EMAIL_VALUE);
    rec.insert().then(
      function(rec: Record) {
        collection
          .find({ [EMAIL_FIELD]: EMAIL_VALUE })
          .toArray()
          .then(function(records: Record[]) {
            if (
              records.length === 1 &&
              records[0].get(EMAIL_FIELD) === EMAIL_VALUE
            )
              done();
          });
      },
      function(err: Error) {
        logger.logError(err);
      }
    );
  });

  it('#FieldTypeRegistry::registerFieldType trying create invalid field', function() {
    try {
      odm.defineCollection({
        name: 'field_definition_invalid_test',
        fields: [
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'custom_field',
            type: 'invalid_field_type'
          }
        ]
      });
      assert.isOk(false, 'Able to create, not defined field type element');
    } catch (err) {
      assert.isOk(true, 'Invalid field type element not created as expected');
    }
  });
});
