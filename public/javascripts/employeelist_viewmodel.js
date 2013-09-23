employeeListModel = (function () {
    var self = this;

    self.sample = ko.observable("hi");
    self.employeesList = ko.observableArray();
    self.curEmpTitle = ko.observable("Title");
    self.curEmpName = ko.observable("Name");

    self.getAllEmployees = function () {
        $.ajax("/employee/all",
            {
                dataType: 'json',
                contentType: "application/json",
                cache: false,
                type: 'get',
                success: function (data) {
                    var formatDate = function (dt) {
                        var padder = function (n) { return n.length > 1 ? n : ("0" + n); };

                        if (dt !== undefined) {
                            var milli = dt.toString().substr(6);
                            var d = new Date(parseInt(milli));
                            var year = d.getFullYear().toString();
                            var month = (d.getMonth() + 1).toString();
                            var day = d.getDate().toString();
                            var hour = d.getHours().toString();
                            var minute = d.getMinutes().toString();
                            var second = d.getSeconds().toString();

                            return padder(hour) + ':' + padder(minute) + ':' + padder(second) + ' ' +
                                padder(month) + '/' + padder(day) + '/' + year;
                        }
                        else {
                            return '';
                        }
                    };

                    self.employeesList(data);
                }
            });
    };

    self.saveNewEmployee = function (data) {
        var emp = { 'title': self.curEmpTitle(), 'name': self.curEmpName() }
        $.ajax("/employee/new",
            {
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(emp),
                cache: false,
                type: 'post',
                success: function (data) {
                    if (data.success) {
                        self.sample("Success");
                        getAllEmployees();
                    }
                }
            });
    };
    //self.getAllEmployees();

    return self;
})();

$(function () {
    //var model = new employeeListModel();
    employeeListModel.getAllEmployees();
    ko.applyBindings(employeeListModel, document.getElementById("emp_manage"));
})