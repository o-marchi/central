defmodule CentralWeb.CentralChannel do
  use CentralWeb, :channel

  def join("central:totens", _payload, socket) do
    {:ok, socket}
  end

  def handle_in("new_command", payload, socket) do
    :rpc.call(String.to_atom(payload["toten"]), Toten.Server, :new_command, [String.to_atom(payload["command"]),  payload["arg"]])
    {:reply, :ok, socket}
  end
end
