const db = require('./src/models');

async function checkWorkflow() {
  try {
    console.log('Checking procurement workflow...\n');

    const request = await db.Request.findOne({
      where: { id: '0267a288-bbe1-4b96-84a0-e139c115df94' },
      include: [
        {
          model: db.ProcurementWorkflow,
          as: 'procurementWorkflow',
          include: [
            {
              model: db.User,
              as: 'approvalAuthority',
              attributes: ['id', 'firstName', 'lastName']
            },
            {
              model: db.User,
              as: 'vicePresident',
              attributes: ['id', 'firstName', 'lastName']
            },
            {
              model: db.User,
              as: 'propertyOfficer',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!request) {
      console.log('Request not found');
      process.exit(0);
    }

    console.log('Request Details:');
    console.log('===============');
    console.log('ID:', request.id);
    console.log('Item Name:', request.itemName);
    console.log('Status:', request.status);
    console.log('Fulfillment Path:', request.fulfillmentPath || 'NULL');
    console.log('Workflow ID:', request.workflowId || 'NULL');

    if (request.procurementWorkflow) {
      const wf = request.procurementWorkflow;
      console.log('\nProcurement Workflow:');
      console.log('====================');
      console.log('Workflow ID:', wf.id);
      console.log('Workflow Type:', wf.workflowType);
      console.log('Current State:', wf.currentState);
      console.log('\nApproval Authority:');
      console.log('------------------');
      console.log('ID:', wf.approvalAuthorityId || 'NULL');
      console.log('Decision:', wf.approvalAuthorityDecision || 'NULL');
      console.log('Comments:', wf.approvalAuthorityComments || 'NULL');
      console.log('Signature:', wf.approvalAuthoritySignature || 'NULL');
      console.log('Timestamp:', wf.approvalAuthorityTimestamp || 'NULL');
      if (wf.approvalAuthority) {
        console.log('User:', `${wf.approvalAuthority.firstName} ${wf.approvalAuthority.lastName}`);
      }
      console.log('\nProperty Officer:');
      console.log('----------------');
      console.log('ID:', wf.propertyOfficerId || 'NULL');
      console.log('Signature:', wf.propertyOfficerSignature || 'NULL');
      console.log('Timestamp:', wf.propertyOfficerTimestamp || 'NULL');
      if (wf.propertyOfficer) {
        console.log('User:', `${wf.propertyOfficer.firstName} ${wf.propertyOfficer.lastName}`);
      }
    } else {
      console.log('\nNo procurement workflow found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWorkflow();
