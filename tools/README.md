## ENV check list

1. Auth callback urls (facebook, google) / facebookAppId / googleAppId
2. Cloudpayments apis
3. Nginx Proxy settings
4. API reach
5. APP reach
6. Google Analytics

## cheatsheet

https://github.com/RehanSaeed/Helm-Cheat-Sheet

## namespaces

- staging
- beta
- production

## deploy environment

helm install [name] [chart] -n namespace -f file

helm install app tools/helm/assist -n staging -f tools/helm/values.staging.yaml
helm install app tools/helm/assist -n beta -f tools/helm/values.beta.yaml
helm install app tools/helm/assist -n production -f tools/helm/values.production.yaml

## upgrade deployment

helm upgrade [name] [chart] -n namespace -f file

helm upgrade app tools/helm/assist -n staging -f tools/helm/values.staging.yaml
helm upgrade app tools/helm/assist -n beta -f tools/helm/values.beta.yaml
helm upgrade app tools/helm/assist -n production -f tools/helm/values.production.yaml
