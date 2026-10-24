module.exports={async rewrites(){return{beforeFiles:[{source:'/',destination:'/index.html'},{source:'/admin',destination:'/admin.html'}]}},
async headers(){return[{source:'/(.*)',headers:[{key:'X-Frame-Options',value:'DENY'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}]}}
