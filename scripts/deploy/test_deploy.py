"""Exercise command rejection and rollback without SSH, Docker or production access."""
import os
import pathlib
import subprocess
import tempfile
import unittest

SOURCE = pathlib.Path(__file__).with_name('deploy.sh').read_text()
DIGEST = 'sha256:' + 'a' * 64


class DeployTests(unittest.TestCase):
    def run_deploy(self, command, fail=''):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            script = SOURCE.replace('export PATH=/usr/sbin:/usr/bin:/sbin:/bin', f'export PATH={directory}:/usr/bin:/bin')
            script = script.replace('[[ $EUID == 0 ]]', '[[ 0 == 0 ]]')
            script = script.replace('/var/lib/codetekt-frontend-deploy', directory)
            (root / 'deploy').write_text(script)
            for name, content in {
                'flock': '#!/bin/sh\nexit 0\n',
                'curl': '#!/bin/sh\n[ "$FAIL" != health ]\n',
                'docker': '''#!/bin/sh
echo "$*" >> "$CALLS"
case "$1" in
  login) cat >/dev/null ;;
  inspect) echo sha256:previous ;;
  pull) [ "$FAIL" != pull ] ;;
  compose)
    echo "image=$FRONTEND_IMAGE" >> "$CALLS"
    [ "$FAIL" != start ] || [ "$FRONTEND_IMAGE" = sha256:previous ] ;;
esac
''',
            }.items():
                target = root / name
                target.write_text(content)
                target.chmod(0o755)
            result = subprocess.run(['bash', str(root / 'deploy'), command], input='ephemeral-test-token\n', text=True, capture_output=True,
                                    env={**os.environ, 'CALLS': str(root / 'calls'), 'FAIL': fail})
            calls = (root / 'calls').read_text() if (root / 'calls').exists() else ''
            self.assertFalse(list(root.glob('docker.*')), 'Temporary registry login must be removed')
            self.assertNotIn('ephemeral-test-token', result.stdout + result.stderr + calls)
            return result.returncode, calls

    def test_rejects_shell_and_other_images(self):
        for value in ['', 'bash', f'deploy {DIGEST} user; id', f'deploy {DIGEST} $(id)',
                      f'deploy {DIGEST}\nuser', 'deploy other/image user', f'deploy {DIGEST} --help']:
            with self.subTest(value=value):
                code, calls = self.run_deploy(value)
                self.assertEqual(code, 64)
                self.assertEqual(calls, '')

    def test_success(self):
        code, calls = self.run_deploy(f'deploy {DIGEST} gormlabenz 10')
        self.assertEqual(code, 0)
        self.assertIn(f'image=ghcr.io/detektivkollektiv/codetekt-frontend@{DIGEST}', calls)
        self.assertNotIn('image=sha256:previous', calls)

    def test_pull_failure_keeps_running_container(self):
        code, calls = self.run_deploy(f'deploy {DIGEST} gormlabenz 10', 'pull')
        self.assertNotEqual(code, 0)
        self.assertNotIn('compose', calls)

    def test_start_and_public_health_failure_roll_back(self):
        for failure in ['start', 'health']:
            with self.subTest(failure=failure):
                code, calls = self.run_deploy(f'deploy {DIGEST} gormlabenz 10', failure)
                self.assertEqual(code, 1)
                self.assertIn('image=sha256:previous', calls)


if __name__ == '__main__':
    unittest.main()
