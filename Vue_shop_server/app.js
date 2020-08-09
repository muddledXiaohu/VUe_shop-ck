const express = require('express')

const compression = require('compression')

const app = express()

// 写到静态托管之前
app.use(compression())
app.use(express.static('./dist'))

app.listen(80,()=>{
    console.log("server running at http://127.0.0.1")
})


// const express = require('express')
// const compression = require('compression')
// const https = require('https')
// const fs = require('fs')

// const app = express()
// //创建配置对象设置公钥和私钥
// const options = {
//     cert:fs.readFileSync('./full_chain.pem'),
//     key:fs.readFileSync('./private.key')
// }

// app.use(compression())
// app.use(express.static('./dist'))


// //启动https服务
// https.createServer(options,app).listen(443)