const db = require('./src/models');

async function checkRequestSignatures() {
  try {
    console.log('Checking request signatures in database...\n');

    // Get the most recent request
    const request = await db.Request.findOne({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: db.User,
          as: 'completer',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!request) {
      console.log('No requests found in database');
      process.exit(0);
    }

    console.log('Most Recent Request:');
    console.log('===================');
    console.log('ID:', request.id);
    console.log('Item Name:', request.itemName);
    console.log('Status:', request.status);
    console.log('Created At:', request.createdAt);
    console.log('\nSignature Fields:');
    console.log('----------------');
    console.log('requesterSignature:', request.requesterSignature || 'NULL');
    console.log('approverSignature:', request.approverSignature || 'NULL');
    console.log('completerSignature:', request.completerSignature || 'NULL');
    console.log('\nUser Reference Fields:');
    console.log('---------------------');
    console.log('requestedBy:', request.requestedBy);
    console.log('approvedBy:', request.approvedBy || 'NULL');
    console.log('completedBy:', request.completedBy || 'NULL');
    console.log('\nAssociated Users:');
    console.log('----------------');
    console.log('Requester:', request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : 'NULL');
    console.log('Approver:', request.approver ? `${request.approver.firstName} ${request.approver.lastName}` : 'NULL');
    console.log('Completer:', request.completer ? `${request.completer.firstName} ${request.completer.lastName}` : 'NULL');
    console.log('\nDate Fields:');
    console.log('-----------');
    console.log('requestDate:', request.requestDate);
    console.log('approvalDate:', request.approvalDate || 'NULL');
    console.log('completionDate:', request.completionDate || 'NULL');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRequestSignatures();
