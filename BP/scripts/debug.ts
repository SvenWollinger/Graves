import { system, world, WeatherType, Player, ItemStack, ItemType } from "@minecraft/server"
import { ModalFormData, ActionFormData } from "@minecraft/server-ui"
import Utilities from "./utilities";
import Config from "./config";

export default class Debug {
    static initDebug() {
        function showDebugConfig(player: Player) {
            const modal = new ModalFormData()
                .title("Debug Settings")
                .toggle("doDaylightCycle", world.gameRules.doDayLightCycle)
                .toggle("doWeatherCycle", world.gameRules.doWeatherCycle)
                .toggle("doMobSpawning", world.gameRules.doMobSpawning);

            modal.show(player).then((response) => {
                if (response.canceled) return
                world.gameRules.doDayLightCycle = response.formValues[0] as boolean
                world.gameRules.doWeatherCycle = response.formValues[1] as boolean
                world.gameRules.doMobSpawning = response.formValues[2] as boolean
                console.warn(response.formValues);
            });
        }

        function showDebugUtils(player: Player) {
            const form = new ActionFormData()
                .title("Debug Utils")
                .button("Set time and weather")
                .button("Clear Entities")
                .button("Teleport up");
            form.show(player).then((response) => {
                switch (response.selection) {
                    case 0: {
                        player.dimension.setWeather(WeatherType.Clear);
                        world.setTimeOfDay(6_000);
                        break;
                    }
                    case 1: {
                        player.dimension.runCommandAsync("kill @e[type=!player]");
                        break;
                    }
                    case 2: {
                        player.runCommandAsync("tp @s ~ ~25 ~");
                        break;
                    }
                }
            });
        }

        world.beforeEvents.itemUse.subscribe((event) => {
            system.run(() => {
                let config = event.itemStack.getDynamicProperty(Config.debugConfigId);
                let utils = event.itemStack.getDynamicProperty(Config.debugUtilsId);
                if (config) showDebugConfig(event.source as Player);
                if (utils) showDebugUtils(event.source as Player);
            });
        })

        world.beforeEvents.chatSend.subscribe((event) => {
            if (!event.message.startsWith("!")) return;

            let cmd = event.message.substring(1, event.message.length);
            system.run(() => {
                switch (cmd) {
                    case "debug": {
                        Utilities.giveItem(event.sender, "minecraft:diamond_sword", "Debug Config", Config.debugConfigId);
                        Utilities.giveItem(event.sender, "minecraft:netherite_sword", "Debug Utils", Config.debugUtilsId);
                        break;
                    }
                }
            })
        });
    }
}
