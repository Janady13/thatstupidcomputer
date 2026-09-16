import {getPage,SITE_ORIGIN} from '../site/content.ts';
import {PROVIDERS,type ProviderId} from './registry.ts';
/** Private QA view of real public answers, not doorway pages or alternate content for bots. */
export function answerCatalog(id:ProviderId) {
  const provider=PROVIDERS[id];
  return {provider:id,product:provider.product,language:'en',status:'source-content-not-observed-model-answer',
    observationFormat:provider.observationFormat,limits:provider.limits,
    pages:provider.answerPaths.map(path=>{
      const page=getPage(path); if(!page) throw new Error('Provider references a missing public answer');
      return {path,canonical:SITE_ORIGIN+path,title:page.title,intro:page.intro,sections:page.sections};
    }),
  };
}
