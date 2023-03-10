import { handler as create } from './create.guild.command';
import { handler as submit } from './submit.guild.command';
import { handler as get } from './get.guild.command';
import { handler as review } from './review.guild.command';
import { handler as ladder } from './ladder.guild.command';
import { handler as proxy } from './proxy.guild.command';
import { handler as listSubmissions } from './list-submissions.guild.command';

export default { create, submit, get, review, ladder, proxy, 'list-submissions': listSubmissions };
