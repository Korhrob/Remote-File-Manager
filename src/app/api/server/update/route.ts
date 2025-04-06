
import { serverPath } from '@/config/const';
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

// Convert exec to return a promise
const execPromise = promisify(exec);

export async function GET(req: Request) {
	try {
	  // Specify the path to the folder where your Git repository is located
	  const repoPath = serverPath;
  
		console.log("git fetch");
	  const { stdout: fetchStdout, stderr: fetchStderr } = await execPromise('git fetch', { cwd: repoPath });

	  if (fetchStderr) {
		return NextResponse.json({ error: `Git fetch failed: ${fetchStderr}` }, { status: 500 });
	  }

	  // Run `git pull` in that directory
	  console.log("git pull");
	  const { stdout, stderr } = await execPromise('git pull', { cwd: repoPath });
  
	  if (stderr) {
		return NextResponse.json({ error: `Git pull failed: ${stderr}` }, { status: 500 });
	  }
  
	  // Return the success message and the output from the `git pull` command
	  return NextResponse.json({ message: `Git pull successful: ${stdout}` });
	} catch (error: any) {
	  console.error('Error executing git pull:', error);
	  return NextResponse.json({ error: `Failed to execute git pull: ${error.message}` }, { status: 500 });
	}
}