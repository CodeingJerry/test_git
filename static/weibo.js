var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var commentsTemplate = function(comments) {
    var html = ''
    for(var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var t = `
            <div data-id=${c.id}>
                ${c.content}
                <a class="a-comment-delete" href="###">删除</a>
            </div>
        `
        html += t
    }
    return html
}

var WeiboTemplate = function(Weibo) {
    var content = Weibo.content
    var id = Weibo.id
    var comments = commentsTemplate(Weibo.comments)
    var t = `
        <div id='Weibo-${id}' class='weibo-cell' data-id=${id}>
            <div class="weibo-content">
                [WEIBO]: ${content}
            </div>
            <a class="Weibo-delete" href="###">
                删除
            </a>
            <a class="Weibo-edit" href="###">
                edit
            </a>
            <div class="comment-list">
                ${comments}
            </div>
            <div class="comment-form">
                <input type="hidden" name="weibo_id" value="">
                <input class="input-weibo-comment" name="content">
                <br>
                <button class="comment-add">添加评论</button>
            </div>
        </div>
    `
    return t
    /*
    上面的写法在 python 中是这样的
    t = """
    <div class="Weibo-cell">
        <button class="Weibo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(Weibo)
    */
}

var insertWeibo = function(Weibo) {
    var WeiboCell = WeiboTemplate(Weibo)
    // 插入 Weibo-list
    var WeiboList = e('.Weibo-list')
    WeiboList.insertAdjacentHTML('beforeend', WeiboCell)
}

var insertComment = function(content, cell) {
    var content = content
    // 插入 Weibo-list
    var form = `
        <div>${content}</div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var insertEditForm = function(content,cell) {
    var content = content
    var form = `
        <div class='Weibo-edit-form'>
            <input class="Weibo-edit-input" value=${content}>
            <button class='Weibo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('beforeend', form)
}

var loadWeibos = function() {
    // 调用 ajax api 来载入数据
    apiWeiboAll(function(r) {
        // console.log('load all', r)
        // 解析为 数组
        var Weibos = JSON.parse(r)
        // 循环添加到页面中
        for(var i = 0; i < Weibos.length; i++) {
            var Weibo = Weibos[i]
            insertWeibo(Weibo)
        }
    })
}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add-weibo')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var title = input.value
        log('click add', title)
        var form = {
            'content': title,
        }
        apiWeiboAdd(form, function(r) {
            // 收到返回的数据, 插入到页面中
            log('debug r, ',r)
            var Weibo = JSON.parse(r)
            insertWeibo(Weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var WeiboList = e('.Weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        log('debug weibo_delete self, ',self)
        log('debug weibo_delete self.classList, ',self.classList)
        if(self.classList.contains('Weibo-delete')){
            // 删除这个 Weibo
            var WeiboCell = self.parentElement
            var Weibo_id = WeiboCell.dataset.id
            log('debug Weibo_id, ', Weibo_id)
            apiWeiboDelete(Weibo_id, function(r){
                log('删除成功', Weibo_id)
                WeiboCell.remove()
            })
        }
    })
}

var bindEventWeiboEdit = function() {
    var WeiboList = e('.Weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('Weibo-edit')){
            // 删除这个 Weibo
            var WeiboCell = self.parentElement
            var WeiboContent = WeiboCell.querySelector('.weibo-content')
            var content = WeiboContent.innerText
            //var WeiboCellNode = self.parentNode
            log('debug WeiboContent, ',WeiboContent)
            //WeiboCell.removeChild(WeiboCell.childNodes[0])
            WeiboContent.style.display="none"
            insertEditForm(content,WeiboCell)
        }
    })
}


var bindEventWeiboUpdate = function() {
    var WeiboList = e('.Weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('Weibo-update')){
            log('点击了 update ')
            //
            var editForm = self.parentElement
            // querySelector 是 DOM 元素的方法
            // document.querySelector 中的 document 是所有元素的祖先元素
            var input = editForm.querySelector('.Weibo-edit-input')
            var title = input.value
            // 用 closest 方法可以找到最近的直系父节点
            var WeiboCell = self.closest('.weibo-cell')
            var Weibo_id = WeiboCell.dataset.id
            var form = {
                'id': Weibo_id,
                'content': title,
            }
            apiWeiboUpdate(form, function(r){
                log('更新成功', Weibo_id)
                var Weibo = JSON.parse(r)
                var selector = '#Weibo-' + Weibo.id
                var WeiboCell = e(selector)
                var titleSpan = WeiboCell.querySelector('.weibo-content')
                titleSpan.style.display="block"
                titleSpan.innerHTML = Weibo.content
//                WeiboCell.remove()
            })
        }
    })
}


        //<div id='Weibo-${id}' class='weibo-cell' data-id=${id}>
        //    <div class="weibo-content">
        //        [WEIBO]: ${content}
        //    </div>
        //    <a class="Weibo-delete" href="###">
        //        删除
        //    </a>
        //    <a class="Weibo-edit" href="###">
        //        edit
        //    </a>
        //    <div class="comment-list">
        //        ${comments}
        //    </div>
        //    <div class="comment-form">
        //        <input type="hidden" class="input-weibo-id" name="weibo_id" value=${id}>
        //        <input class="input-comment" name="content">
        //        <br>
        //        <button class="comment-add">添加评论</button>
        //    </div>
        //</div>

var bindEventCommentAdd = function() {

    var WeiboList = e('.Weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        log('debug weibo_delete self, ',self)
        log('debug weibo_delete self.classList, ',self.classList)
        if(self.classList.contains('comment-add')) {
            var WeiboCell = self.closest('.weibo-cell')
            log('debug WeiboCell, ',WeiboCell)
            var commentCell = WeiboCell.querySelector('.comment-list')
            log('debug commentCell_0, ',commentCell)
            var weiboid = WeiboCell.dataset.id
            log('debug weiboid, ',weiboid)
            var input_title = WeiboCell.querySelector('.input-weibo-comment')
            log('debug input_title, ',input_title)
            var title = input_title.value
            log('click add', title)
            var form = {
                'weibo_id':weiboid,
                'content': title,
            }
            log('debug form, ',form)
            apiCommentAdd(form, function(r) {
                // 收到返回的数据, 插入到页面中
                log('debug r, ',r)
                var Comment = JSON.parse(r)
                var content = Comment['content']
                log('debug comment_content, ',content)
                //var commentCell = self.closest('.comment-list')
                log('debug commentCell_1, ',commentCell)
                insertComment(content,commentCell)
            })
        }
    })
}

var bindEventCommentDelete = function() {
    var WeiboList = e('.Weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        log('debug weibo_delete self, ',self)
        log('debug weibo_delete self.classList, ',self.classList)
        if(self.classList.contains('a-comment-delete')){
            // 删除这个 Weibo
            var CommentCell = self.parentElement
            var Comment_id = CommentCell.dataset.id
            log('debug Comment_id, ', Comment_id)
            apiCommentDelete(Comment_id, function(r){
                log('删除成功', Comment_id)
                CommentCell.remove()
            })
        }
    })
}

var bindEvents = function() {
    bindEventWeiboAdd()
    bindEventWeiboDelete()
    bindEventWeiboEdit()
    bindEventWeiboUpdate()
    bindEventCommentAdd()
    bindEventCommentDelete()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
