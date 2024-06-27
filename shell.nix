{
    # Pinning packages with URLs inside a Nix expression
    # https://nix.dev/tutorials/first-steps/towards-reproducibility-pinning-nixpkgs#pinning-packages-with-urls-inside-a-nix-expression
    # Picking the commit can be done via https://status.nixos.org,
    # which lists all the releases and the latest commit that has passed all tests.
    pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/c002c6aa977ad22c60398daaa9be52f2203d0006.tar.gz") {},
}:

pkgs.mkShell {
    buildInputs = [
        pkgs.git
        pkgs.nodePackages.pnpm
        pkgs.process-compose
    ];

    shellHook = ''
        pnpm install
        git --version
        echo "pnpm version: " && pnpm -v
        echo "node version: " && node -v
    '';
}
