Feature: タスク一覧の表示

  Scenario: タスクが存在しない
    Given タスクが1件も存在しない
    When 利用者がタスクボードを開く
    Then "No tasks yet." と表示される

  Scenario: 登録済みタスクが存在する
    Given "Read Continuous Delivery" という未完了タスクが存在する
    When 利用者がタスクボードを開く
    Then "Read Continuous Delivery" と表示される
    And "No tasks yet." は表示されない

  Scenario: 新しいタスクを登録する
    Given タスクが1件も存在しない
    When 利用者が "Write deployment pipeline" というタスクを登録する
    Then 登録は成功する
    And "Write deployment pipeline" が未完了タスクとして存在する
    And タスクボードを開くと "Write deployment pipeline" と表示される
    And "No tasks yet." は表示されない
