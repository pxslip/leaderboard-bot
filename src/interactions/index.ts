import { handler as storeSubmission } from './store-submission.js';
import { handler as confirmSubmission } from './confirm-submission.js';
import { handler as deleteSubmission } from './delete-submission.js';
import { handler as rejectSubmission } from './reject-submission.js';
import { handler as storeEntry } from './store-entry.js';

export default { storeSubmission, confirmSubmission, deleteSubmission, rejectSubmission, storeEntry };
