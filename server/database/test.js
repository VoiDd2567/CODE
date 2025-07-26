const mongoConnect = require("./mongo_connect");
const MongoGetData = require("./mongo_get_data");
const MongoCreateData = require("./mongo_create_data");
const MongoUpgradeData = require("./mongo_update_data");

const ExerciseModel = require("./schemas/Exercise");

(async () => {
  await mongoConnect();

  // ➕ Пример упражнения
  const exampleExercise = new ExerciseModel({
    type: "basic",
    name: "Sum of Digits",
    description: new Map([
      ["en", "Write a function that returns the sum of digits of a given number."],
      ["et", "Kirjuta funktsioon, mis tagastab arvu numbrite summa."],
      ["ru", "Напиши функцию, возвращающую сумму цифр числа."]
    ]),
    files: new Map([
      ["main.py", "# Write your solution here\n"],
      ["README.txt", "This exercise is about summing digits."]
    ]),
    programmingLng: "python",
    answer: "def sum_digits(n): return sum(map(int, str(n)))",
    choises: []
  });

  await exampleExercise.save();
  console.log("✅ Пример задания успешно добавлен в базу.");
})();
