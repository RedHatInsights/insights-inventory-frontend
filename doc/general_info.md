# Inventory detail - General information tab

## DataCollectorsCard
“Data collector” designates the specific tool or product that collects the data from users' hosts and sends them to Red Hat. In this card we show a table with the default collectors like puptoo, RHSM and Yupana. We provide a possibility to have custom collectors by passing a `collectors` array. You can also pass a custom `dataMapper` function to replace the default data collectors table.

### Usage
```JSX
<GeneralInformation
    {...someProps}
    DataCollectorsCardWrapper={(props) => (
        <Suspense fallback="">
            <DataCollectorsCard
                {...props}
                collectors={[
                    {
                        name: 'Custom reporter name',
                        status: customReporterStatus,
                        updated: customReporterLastCheckIn,
                        details: {
                            name: 'Custom reporter id name',
                            id: customReporterId
                        }
                    },
                ]}
            />
        </Suspense>
    )}
/>
 ```