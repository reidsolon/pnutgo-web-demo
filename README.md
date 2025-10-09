# Appetiser Baseplate Core

Baseplate Core is a boilerplate Laravel backend API framework with modular architecture powered by [Concord Modules](https://konekt.dev/concord/1.x/README). It includes a built-in `lego` command to manage installable modules, providing a flexible and scalable structure for backend development.

## Table of Contents

- [Features](#features)
- [Modules](#modules)
- [Requirements](#requirements)
- [Installation](#installation-5-minutes)
- [Lego Commands](#lego-commands)
- [Filament Admin Panel](#filament-admin-panel)
- [S3 CORS Configuration](#s3-cors-configuration-optional)
- [Serving Options](#serving-options)
- [Coding Standards](#coding-standards)
- [CI/CD](#cicd)
- [Useful Libraries](#useful-libraries)
- [Appetiser Tools](#appetiser-tools)
- [Contributing](#contributing)

## Features

- Laravel 
- Modular structure using Concord
- Preconfigured with:
  - Concord Modules
  - Composer Merge Plugin
  - `lego` CLI commands for module management
- Integrated [Filament Admin](https://filamentphp.com/) CMS support

## Modules

Modules are Concord in-app packages, easily installed via the `lego` command:

```
php artisan lego:install ModuleName
```

Recommended read: [Concord Modules Overview](https://konekt.dev/concord/1.x/modules)

## Requirements

- PHP: 8.3 or higher
- Composer: v2.3 or later
- Extensions:
  - BCMath
  - Ctype
  - JSON
  - Mbstring
  - OpenSSL
  - PDO
  - SQLite 3
  - Tokenizer
  - XML
  - Exif

Note: Use an older version of Baseplate Core if your PHP version is lower than 8.2.

## Installation via script - Mac/Linux Only
Note: Make sure you installed all php extension

```
git clone git@gitlab.com:appetiser/baseplate/backend/baseplate-core.git project101
cd project101
./setup.sh
```


## Normal Installation 

### 1. Clone the Baseplate core Repository

```
git clone git@gitlab.com:appetiser/baseplate/backend/baseplate-core.git project101
cd project101
composer install
```

### 2. Install Core Modules

```
php artisan lego:install AuthModule
php artisan lego:install AdminModule
php artisan lego:install AppSettingsModule
php artisan lego:install ReportingModule
php artisan lego:install MediaModule
```
Install module dependencies through composer

```
composer install
```

### 3. Register Modules in `config/concord.php`

```php
return [
    'modules' => [
        \Appetiser\Auth\Providers\ModuleServiceProvider::class,
        \Appetiser\Admin\Providers\ModuleServiceProvider::class,
        \Appetiser\Reporting\Providers\ModuleServiceProvider::class,
        \Appetiser\Media\Providers\ModuleServiceProvider::class,
        \Appetiser\AppSettings\Providers\ModuleServiceProvider::class,
    ],
    'register_route_models' => true,
];
```

### 4. Update `config/auth.php`

Change the `users` provider to use the AuthModule’s `User` model:

```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => Appetiser\Auth\Models\User::class,
    ],
],
```

### 5. Configure `.env`

```
cp .env.example .env
vim .env
```

Update your database and other environment variables.

### 6. Run Migrations

```
php artisan migrate
```

### 7. Serve the App

```
php artisan serve
```

Your project is now ready to use

1. Admin Filament URL: http://127.0.0.1:8000/admin

2. Telescope API: http://127.0.0.1:8000/telescope

3. API URL: http://127.0.0.1:8000/api/v1

## Lego Commands

- `php artisan lego:list-modules` – View all installable modules
- `php artisan lego:install module_name` – Install a module
- `php artisan lego:create module_name` – Create a new module

## Filament Admin Panel

Baseplate Core includes support for [Filament PHP](https://filamentphp.com/) for building admin panels.

### 1. Create an Admin User

```
php artisan admin:new
```

### 2. Access the Admin Panel

Visit: http://127.0.0.1:8000/admin



Note: you can initialize a new Filament Panel Provider by 

```
php artisan initiate-cms
```

This generates `Providers/Filament/AdminPanelProvider.php`.

Modules that contain Filament resources, pages, widgets, or Livewire components should be registered inside `AdminPanelProvider.php`.

### Example: Dynamic Panel Configuration

```php
return $panel
    ->when($isLocal, function (Panel $panel) {
        $panel->domain(config('app.url'));
        $panel->path('admin');
    }, function (Panel $panel) {
        $panel->domain(config('app.cms_url'));
    });
```

### Discover Filament Components from Modules

```php
concord()->getModules()->each(function (BaseBoxServiceProvider $module) use (&$panel) {
    $basePath = $module->getBasePath();
    $namespaceRoot = $module->getNamespaceRoot();

    $panel->discoverResources(
        in: $basePath . '/Filament/Resources',
        for: $namespaceRoot . '\\Filament\\Resources'
    );

    $panel->discoverPages(
        in: $basePath . '/Filament/Pages',
        for: $namespaceRoot . '\\Filament\\Pages'
    );

    $panel->discoverWidgets(
        in: $basePath . 'Filament/Widgets',
        for: $namespaceRoot . '\\Filament\\Widgets'
    );

    $panel->discoverLivewireComponents(
        in: $basePath . 'Filament/Livewire',
        for: $namespaceRoot . '\\Filament\\Livewire'
    );
});
```

### Running on a Subdomain

Update `.env`:

```
APP_URL=http://localhost
APP_CMS_URL=http://cms.localhost
```

Update the panel config:

```php
return $panel->domain(config('app.cms_url'));
```

## S3 CORS Configuration (Optional)

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["HEAD", "GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["Access-Control-Allow-Origin"],
        "MaxAgeSeconds": 3000
    }
]
```

## Serving Options

Use built-in Laravel server or deploy on LAMP/XAMPP/LEMP.

```
php artisan serve
```

## Coding Standards

PSR-2 is enforced using `phpcs.xml`.

Check your code:

```
vendor/bin/phpcs
```

## CI/CD

CI/CD integration is under development. Stay tuned for updates.

## Useful Libraries

- https://konekt.dev/concord/1.x/overview
- https://github.com/BenSampo/laravel-enum

## Appetiser Tools

- https://gitlab.com/appetiser/tools/aws-ses-logger

## Feature Documentation

### Multi-Companion Spawn System

PnutGo includes an advanced multi-companion spawn system that allows spawns to contain multiple companions while maintaining full backward compatibility.

**Documentation:**
- [`MULTI_COMPANION_SPAWN_IMPLEMENTATION.md`](./MULTI_COMPANION_SPAWN_IMPLEMENTATION.md) - Complete implementation guide
- [`MULTI_COMPANION_SPAWN_QUICK_REFERENCE.md`](./MULTI_COMPANION_SPAWN_QUICK_REFERENCE.md) - Developer quick reference

**Key Features:**
- Support for spawns with multiple companions
- Backward compatibility with existing single-companion spawns
- Flexible companion capture system
- Comprehensive test coverage
- Progressive spawn capture logic

## Contributing

If you find any issues, typos, or bugs, feel free to submit a merge request:  
https://docs.gitlab.com/ee/gitlab-basics/add-merge-request.html

Maintainers:

- Anthony Alaan (anthony.alaan@appetiser.com.au)
- Wilmon Agulo (wilmon.agulo@appetiser.com.au)
