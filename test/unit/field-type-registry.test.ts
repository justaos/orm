/*
import { assertEquals, assert } from 'https://deno.land/std@0.107.0/testing/asserts.ts';
import {
  describe,
  it
} from 'https://deno.land/x/test_suite@v0.8.0/mod.ts';

import { ODM, PrimitiveDataType, Record } from '../../mod.ts';
import { Session } from '../test.utils.ts';
import { Logger } from '../../deps.ts';
import Schema from '../../src/collection/Schema.ts';
import FieldType from '../../src/field-types/FieldType.ts';

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

  it('#FieldTypeRegistry::addFieldType Registering Custom field type', function () {
    odm.addFieldType(
      class extends FieldType {
        constructor(odm: ODM) {
          super(odm, PrimitiveDataType.STRING);
        }

        getName() {
          return 'email';
        }

        async validateValue(
          schema: Schema,
          fieldName: string,
          record: any,
          context: any
        ) {
          const pattern = '(.+)@(.+){2,}\\.(.+){2,}';
          if (!new RegExp(pattern).test(record[fieldName]))
            throw new Error('Not a valid email');
        }

        validateDefinition(fieldDefinition: any) {
          return !!fieldDefinition.name;
        }

        getValueIntercept(
          schema: Schema,
          fieldName: string,
          record: any,
          context: any
        ): any {
          return record[fieldName];
        }

        setValueIntercept(
          schema: Schema,
          fieldName: string,
          newValue: any,
          record: any
        ): any {
          return newValue;
        }

        async getDisplayValue(
          schema: any,
          fieldName: string,
          record: any,
          context: any
        ) {
          return record[fieldName];
        }
      }
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
      assert( true, 'Custom field defined as expected');
    } catch (err) {
      console.error(err);
      assert( false, 'Custom field not defined as expected');
    }
  });

  it('#FieldTypeRegistry::registerFieldType creating record with custom field type', async () => {
    let collection = odm.collection(MODEL_NAME);
    let rec = collection.createNewRecord();
    rec.set('name', 'RAM');
    rec.set(EMAIL_FIELD, EMAIL_VALUE);
    rec.insert().then(
      function (rec: Record) {
        collection
          .find({ [EMAIL_FIELD]: EMAIL_VALUE })
          .toArray()
          .then(function (records: Record[]) {
            if (
              records.length === 1 &&
              records[0].get(EMAIL_FIELD) === EMAIL_VALUE
            )
              done();
          });
      },
      function (err: Error) {
        logger.logError(err);
      }
    );
  });

  it('#FieldTypeRegistry::registerFieldType trying create invalid field', function () {
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
      assert( false, 'Able to create, not defined field type element');
    } catch (err) {
      assert( true, 'Invalid field type element not created as expected');
    }
  });
});
*/
