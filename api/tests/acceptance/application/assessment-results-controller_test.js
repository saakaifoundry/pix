const { expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe.only('Acceptance | Controller | assessment-results-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /assessment-results', () => {
    const certificationId = 2;
    const options = {
      method: 'POST', url: '/api/assessment-results', payload: {
        data: {
          type: 'assessment-results',
          attributes: {
            certificationId: certificationId,
            level: 3,
            pixScore: 27,
            emitter: 'Jury',
            comment: 'Envie de faire un nettoyage de printemps dans les notes',
            competenceMarks : [
              {
                level: 2,
                score: 18,
                area_code: 2,
                competence_code: 2.1
              },{
                level: 3,
                score: 27,
                area_code: 3,
                competence_code: 3.2
              },{
                level: 1,
                score: 9,
                area_code: 1,
                competence_code: 1.3
              }
            ]
          }
        }
      }
    };

    before(() => { return knex('certification-courses').delete()
      .then(() => knex('assessments').delete())
      .then(() => {
      return knex('assessments')
        .insert({
          id: '1',
          courseId: certificationId,
          type: 'CERTIFICATION'
        });
      })
      .then(() => {
        return knex('certification-courses')
          .insert({ id: certificationId })
      })
    });

    afterEach(() => {
      knex('competence-marks').delete().then(() => knex('assessment-results').delete())
    });

    after(() => {
      knex('certification-courses').delete().then(() => knex('assessments').delete())
    });

    it('should return an OK status after saving in database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        });
    });

    it('should save a assessment-results and 3 marks', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then(() => knex('assessment-results').select())
        .then((result) => {
          expect(result).to.have.lengthOf(1);
        })
        .then(() => knex('competence-marks').select())
        .then((marks) => {
          expect(marks).to.have.lengthOf(3);
        });
    });
  });
});