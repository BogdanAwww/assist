#!/bin/bash

grep -o "path: '.*'" ./src/web/routes/routes.tsx

# static|auth|signin|signup|forgot-password|restore-password|signout|verify|choose-role|portfolio|search|project|profile|applications|subscription|favorites|projects
