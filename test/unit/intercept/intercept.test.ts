/*
import { assert } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { beforeAll, describe, it } from 'https://deno.land/std@0.166.0/testing/bdd.ts';

import { ODM, OperationInterceptorInterface, OperationType, OperationWhen, Record } from '../../../mod.ts';
import { logger, Session } from '../../test.utils.ts';

describe('Operations Intercept', () => {
  let odm: ODM;
  const MODEL_NAME = 'intercept';

  beforeAll(async () => {
    odm = await Session.getODMByForce();
  });

  it('#ODM::addInterceptor', async () => {

    odm.addInterceptor(
      new (class extends OperationInterceptorInterface {
        getName() {
          return 'my-intercept';
        }

        async intercept(
          collectionName: string,
          operation: OperationType,
          when: OperationWhen,
          records: Record[]
        ) {
          if (collectionName === MODEL_NAME) {
            if (operation === OperationType.CREATE) {
              logger.info(
                `[collectionName=${collectionName}] [operation=${operation}] [when=${when}]`
              );
              if (when === OperationWhen.BEFORE) {
                logger.info('before');
                for (let record of records)
                  record.set('computed', 'this is computed');
              }
            }
          }
          return records;
        }
      })()
    );

    odm.defineCollection({
      name: MODEL_NAME,
      fields: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'computed',
          type: 'string'
        }
      ]
    });

    const interceptTestCollection = odm.collection(MODEL_NAME);
    const s = interceptTestCollection.createNewRecord();
    s.set('name', 'John');
    s.insert().then(
      function(rec: Record) {
        assert(
          rec.get('computed') === 'this is computed',
          'read interceptor not computed the value'
        );
      },
      function(err: Error) {
        logger.info(err.message + '');
      }
    );
  });

  it('#model define check', async () => {

    odm.deleteInterceptor('my-intercept');

    const interceptTestCollection = odm.collection(MODEL_NAME);
    const s = interceptTestCollection.createNewRecord();
    s.set('name', 'Ravi');
    s.insert().then(
      function(rec: Record) {
        assert(
          rec.get('computed') !== 'this is computed',
          'read interceptor computed the value'
        );
      },
      function(err: Error) {
        console.log(err);
      }
    );
  });
});

*/
