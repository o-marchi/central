defmodule Central.Toten do
  use GenServer

  def start_link(_state) do
    GenServer.start_link(__MODULE__, [])
  end

  def init(_state) do
    send()

    {:ok, {}}
  end

  def handle_info(:update, interval) do
    broadcast_totens(Node.list)
    send()

    {:noreply, interval}
  end

  defp send do
    Process.send_after self(), :update, 2_000
  end

  defp broadcast_totens(totens) do
    CentralWeb.Endpoint.broadcast!("central:totens", "totens", %{
      totens: totens
    })
  end
end
