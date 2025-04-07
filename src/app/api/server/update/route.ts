
import { serverPath } from '@/config/const';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(req: NextRequest) {
	try {
  
		console.log("git fetch");
		const { stdout: fetchStdout, stderr: fetchStderr } = await execPromise('git fetch', { cwd: serverPath });

		if (fetchStderr) {
			return NextResponse.json({ error: `git fetch failed: ${fetchStderr}` }, { status: 500 });
		}

		console.log("git pull");
		const { stdout, stderr } = await execPromise('git pull', { cwd: serverPath });

		if (stderr) {
			return NextResponse.json({ error: `git pull failed: ${stderr}` }, { status: 500 });
		}

		return NextResponse.json({ message: `git pull successful: ${stdout}` });
	} catch (error: any) {
		console.error('Error executing git fetch or pull:', error);
		return NextResponse.json({ error: `Failed to execute git fetch or pull: ${error.message}` }, { status: 500 });
	}
}