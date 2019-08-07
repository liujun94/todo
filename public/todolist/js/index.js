// 定义一个数组存储数据库中的数据,保持ui界面中的数据同步
let taskArray = [];
// 获取ul列表元素
let taskBox = $(".todo-list");
// 获取输入框元素
let task = $("#task");
let strong = $("#strong");
// 渲染数据
renderData();

function renderData() {
    $.ajax({
        type: "get",
        url: "/todo/task",
        success: function (res) {
            taskArray = res;
            render(taskArray);
            // 计算未完成的任务的数量
            calcCount(taskArray);
        }
    });
}
// 点击all按钮 展示所有的任务
$("#all").on("click", function () {
    $(this).addClass("selected").parent().siblings().find("a").removeClass("selected");
    renderData();
});
// 点击active按钮 正在进行的任务
$("#active").on("click", function () {
    $(this).addClass("selected").parent().siblings().find("a").removeClass("selected");
    let activeArr = taskArray;
    let newArr = activeArr.filter(item => item.completed == false);
    render(newArr)
    // 计算未完成的任务的数量
    calcCount(newArr);
});
// 点击completed按钮 已完成的任务
$("#completed").on("click", function () {
    $(this).addClass("selected").parent().siblings().find("a").removeClass("selected");
    let completedArr = taskArray;
    let newArr = completedArr.filter(item => item.completed == true);
    render(newArr);
    // 计算未完成的任务的数量
    calcCount(newArr);
});
// 添加数据
task.on("keyup", function (e) {
    if (e.keyCode == 13) {
        let $val = $(this).val().trim().replace(/\s/g, '');
        if ($val.length == 0) {
            alert('输入的数据不能为空');
            return false;
        }
        const isHas = taskArray.find(item => item.title == $val)
        if (isHas) {
            alert('该任务已存在,不能重复添加');
            return false;
        }
        // 发送新增的ajax请求
        $.ajax({
            type: "post",
            url: "/todo/addTask",
            data: JSON.stringify({
                title: $val
            }),
            contentType: 'application/json',
            success: function (res) {
                taskArray.push(res);
                render(taskArray);
                // 计算未完成的任务的数量
                calcCount(taskArray);
                task.val("");
            }
        });
    }
});

// 删除数据
taskBox.on("click", ".destroy", function () {
    const id = $(this).attr("data-id");
    // 发送ajax请求,删除数据
    $.ajax({
        type: "get",
        url: "/todo/deleteTask",
        data: {
            _id: id
        },
        success: function (res) {
            let index = taskArray.findIndex(item => item._id == id);
            taskArray.splice(index, 1);
            render(taskArray);
            // 计算未完成的任务的数量
            calcCount(taskArray);
        }
    });
});
// 修改复选框的状态
taskBox.on("change", ".toggle", function () {
    let inpStatus = $(this).prop("checked");
    const id = $(this).siblings(".destroy").attr("data-id");
    // 发送ajax请求修改数据
    $.ajax({
        type: "post",
        url: "/todo/modifyTask",
        contentType: 'application/json',
        data: JSON.stringify({
            _id: id,
            completed: inpStatus
        }),
        success: function (res) {
            let currTask = taskArray.find(item => item._id == id);
            currTask.completed = res.completed;
            render(taskArray);
            // 计算未完成的任务的数量
            calcCount(taskArray);
        }
    });
});
// 修改输入框的值
// 注册双击事件
let flag = '';
taskBox.on("dblclick", "label", function () {
    // 隐藏li盒子
    $(this).parents("li").addClass("editing");
    flag = $(this).text();
    $(this).parents(".view").siblings(".edit").val($(this).text()).focus();
});
// 输入框失去焦点事件
taskBox.on("blur", ".edit", function () {
    let $val = $(this).val();
    const id = $(this).siblings(".view").find(".destroy").attr("data-id");
    let isHas = taskArray.find(item => item.title == $val);
    // 如果不做任何修改,直接阻止代码向下执行
    if (flag == $val) {
        $(this).parent().removeClass("editing");
        // 直接阻止代码向下执行,减少ajax请求发送的次数
        return false;
    }
    if (isHas) {
        alert('该任务已存在,不能重复添加');
        return false;
    }
    // 发送ajax请求修改数据
    $.ajax({
        type: "post",
        url: "/todo/modifyTask",
        contentType: 'application/json',
        data: JSON.stringify({
            _id: id,
            title: $val
        }),
        success: function (res) {
            let currTask = taskArray.find(item => item._id == id);
            currTask.title = res.title;
            render(taskArray);
            // 计算未完成的任务的数量
            calcCount(taskArray);
        }
    });
    $(this).parent().removeClass("editing");
});




// 渲染数据的方法
function render(arr) {
    let html = template('taskTpl', {
        tasks: arr
    });
    taskBox.html(html);
}

// 定义一个计算未完成任务数量的函数
function calcCount(arr) {
    let count = 0;
    let newArr = arr.filter(item => item.completed == false);
    count = newArr.length;
    strong.text(count);
}

// 进度条开始
$(document).on("ajaxStart", function () {
    NProgress.start();
})
// 进度条结束
$(document).on("ajaxComplete", function () {
    NProgress.done();
})