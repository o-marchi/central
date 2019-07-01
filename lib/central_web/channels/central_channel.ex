defmodule CentralWeb.CentralChannel do
  use CentralWeb, :channel

  def join("central:totens", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("echo", payload, socket) do
    {:reply, payload, socket}
  end
end
