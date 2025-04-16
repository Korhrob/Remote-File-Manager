import { serverPath } from '@/config/const';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';

const execPromise = promisify(exec);

export async function GET(req: NextRequest) {
	try {
		const build = spawn('make', ['build'], { cwd: serverPath });

		let errorOutput = '';

		build.stdout.on('data', (data) => {
			const line = data.toString();
			console.log(line);
		});

		build.stderr.on('data', (data) => {
			errorOutput += data.toString();
		});

		build.on('close', (code) => {
			if (code === 0) {
				NextResponse.json({
					status: 'success',
					message: 'Build completed successfully.',
				});
			} else {
				NextResponse.json({
					status: 'error',
					message: 'Build failed.',
					details: errorOutput || 'Unknown error occurred.',
				});
			}
		});
	} catch (error: any) {
		console.error('Error executing git pull:', error);
		return NextResponse.json(
			{ message: `Failed to execute build: ${error.message}` },
			{ status: 500 },
		);
	}
}
