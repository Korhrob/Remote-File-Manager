
import { serverPath } from '@/config/const';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(req: NextRequest) {
	try {
  
		console.log("git fetch");
		const fetchProcess = exec('git fetch', { cwd: serverPath });

        fetchProcess.stdout?.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        fetchProcess.stderr?.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        fetchProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Git fetch successful.');
            } else {
                console.error(`Git fetch failed with code: ${code}`);
                return NextResponse.json({ message: `Git fetch failed. Code: ${code}` }, { status: 500 });
            }
        });

		console.log("git pull");
		const pullProcess = exec('git fetch', { cwd: serverPath });

        pullProcess.stdout?.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        pullProcess.stderr?.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pullProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Git pull successful.');
				return NextResponse.json({ message: `Git pull success.` }, { status: 200 });
            } else {
                console.error(`Git pull failed with code: ${code}`);
                return NextResponse.json({ message: `Git pull failed. Code: ${code}` }, { status: 500 });
            }
        });

		return NextResponse.json({ message: `Server updated.` }, { status: 200 });

	} catch (error: any) {
		console.error('Error executing git fetch or pull:', error);
		return NextResponse.json({ message: `Failed to execute git fetch or pull: ${error.message}` }, { status: 500 });
	}
}