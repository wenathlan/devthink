# frozen_string_literal: true

module DevThink
  VERSION = "1.1.8"

  def self.command(*arguments)
    [ENV.fetch("DEVTHINK_BIN", "devthink"), *arguments]
  end

  def self.start(*arguments, **options)
    Process.spawn(*command(*arguments), **options)
  end
end
