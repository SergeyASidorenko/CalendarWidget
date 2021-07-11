<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/style.css">
    <title>Календарь</title>
</head>

<body>
    <div class="container">
        <input type="text" name="date" id="date" placeholder="Выберите дату ...">
    </div>
    <script src="js/main.js"></script>
    <script>
        var calendar = new Calendar('date');
        calendar.init();
    </script>
</body>
</html>