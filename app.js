const express = require('express');
const { spawn } = require('child_process');

const app = express();

app.use(
  express.json({
    limit: '10mb',
  }),
);
app.use(express.urlencoded({ limit: '10mb', extended: false }));

app.post('/webhook', (req, res) => {
  // 检查事件类型是否为 push
  console.log('x-github-event:', req.headers['x-github-event']);
  if (req.headers['x-github-event'] === 'push') {
    // 获取仓库信息
    const repository = req.body.repository;
    const repoName = repository.name;
    const repoURL = repository.clone_url;
    console.log('repoName: ',repoName);
    console.log('repoURL: ',repoURL);
    // 需要先删除本地仓库，否则 clone 会失败
    const rmProcess = spawn('rm', ['-rf', `../${repoName}`]);
    rmProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Delete successful');
        // 执行 git clone 命令
      } else {
        console.error(`Delete failed with code ${code}`);
      }
      const cloneProcess = spawn('git', [
        'clone',
        repoURL,
        `../${repoName}`,
      ]);
      
      cloneProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Clone successful');
          // 执行其他操作，例如重启服务器、更新数据库等
        } else {
          console.error(`Clone failed with code ${code}`);
        }
        res.sendStatus(200);
      });
    })
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Service Error');
});

// 导出 Express app
module.exports = app;
