var employeeListModel = function () {
    var self = this;

    self.sample = ko.observable("hi");
    self.employeesList = ko.observableArray();

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

    //self.getAllEmployees();

    //return self;
};

$(function () {
    var model = new employeeListModel();
    model.getAllEmployees();
    ko.applyBindings(model, document.getElementById("emp_list"));
})