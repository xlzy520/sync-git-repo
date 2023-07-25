const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');

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
    const kRepoURL = repoURL.replace('https://github.com', 'https://github.com');
    console.log('repoName: ', repoName);
    console.log('repoURL: ', kRepoURL);
    if (!repoName) {
      res.sendStatus(200);
      return;
    }
    const repoPath = `/www/wwwroot/${repoName}`;
    // 检查本地是否存在仓库
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath);
    }
    // 进入repoName文件夹
    exec(`cd /www/wwwroot/${repoName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`cd failed with error: ${error}`);
        res.sendStatus(200);
        return;
      }
      console.log('cd successful');
      // 需要先删除本地仓库，否则 clone 会失败
      exec(`rm -rf /www/wwwroot/${repoName}/origin`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Delete failed with error: ${error}`);
          res.sendStatus(200);
          return;
        }
        console.log('Delete successful');
        // 执行 git clone 命令
        exec(`git clone ${kRepoURL} /www/wwwroot/${repoName}/origin`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Clone failed with error: ${error}`);
            res.sendStatus(200);
            return;
          }
          console.log('Clone successful');
          // 将该目录下的index.html文件移动到上层
          exec(`mv /www/wwwroot/${repoName}/origin/index.html /www/wwwroot/${repoName}/`, (error, stdout, stderr) => {
            if (error) {
              console.error(`mv failed with error: ${error}`);
              res.sendStatus(200);
              return;
            }
            console.log('mv successful');
            res.sendStatus(200);
          })
        });
      });
    })
  } else {
    res.sendStatus(200);
  }
});

app.get('/webhook_test', (req, res) => {
  let { repoURL, } = req.query;
  if (!repoURL) {
    repoURL = 'https://github.com/dashjidasnda/yasa.cc.git'
  }
  // const kRepoURL = repoURL.replace('https://github.com', 'https://gitclone.com');
  const kRepoURL = repoURL
  const repoName = repoURL.split('/').pop().replace('.git', '')
  console.log('repoName: ', repoName);
  console.log('repoURL: ', kRepoURL);
  console.log('path: ', kRepoURL);
  const repoPath = `/www/wwwroot/${repoName}`;
  exec(`cd /www/wwwroot/${repoName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`cd failed with error: ${error}`);
      res.sendStatus(200);
      return;
    }
    console.log('cd successful');
    // 需要先删除本地仓库，否则 clone 会失败
    exec(`rm -rf /www/wwwroot/${repoName}/origin`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Delete failed with error: ${error}`);
        res.sendStatus(200);
        return;
      }
      console.log('Delete successful');
      // 执行 git clone 命令
      exec(`git clone ${kRepoURL} /www/wwwroot/${repoName}/origin`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Clone failed with error: ${error}`);
          res.sendStatus(200);
          return;
        }
        console.log('Clone successful');
        // 将该目录下的index.html文件移动到上层
        exec(`mv /www/wwwroot/${repoName}/origin/index.html /www/wwwroot/${repoName}/`, (error, stdout, stderr) => {
          if (error) {
            console.error(`mv failed with error: ${error}`);
            res.sendStatus(200);
            return;
          }
          console.log('mv successful');
          res.sendStatus(200);
        })
      });
    });
  })
});

app.get('/test', (req, res) => {
  res.send('test');
})


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Service Error');
});

// 导出 Express app
module.exports = app;
