import {readFileSync,realpathSync,mkdirSync,lstatSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
/** Must be called before any collection. cwd is never an output authority. */
export function evidenceDirectory(projectRoot:string):string {
  let root:string;
  try {
    root=realpathSync(projectRoot);
    const pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
    if(pkg.name!=='thatstupidcomputer'||!lstatSync(resolve(root,'apps/web/src')).isDirectory()) throw new Error();
  } catch { throw new Error('Evidence requires a verified project root'); }
  const directory=resolve(root,'.build/discovery');
  mkdirSync(directory,{recursive:true,mode:0o700});
  if(realpathSync(directory)!==directory||lstatSync(directory).isSymbolicLink()) throw new Error('Unsafe evidence directory');
  return directory;
}
export function saveEvidence(directory:string,provider:string,startedAt:string,report:unknown) {
  if(!/^[a-z]+$/.test(provider)||!/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(startedAt)) throw new Error('Invalid evidence identifier');
  const file=resolve(directory,`${provider}-${startedAt.replace(/[:.]/g,'-')}.json`);
  writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
  return file;
}
